import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import sharp from 'sharp'

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'angel-photography-images'
const MAX_IMAGE_SIZE = 2048 // Max 2048px width
const QUALITY = 80

export async function GET() {
  try {
    const result = await s3Client.send(new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: 'gallery/',
    }))

    const images = (result.Contents || [])
      .filter(item => item.Key && !item.Key.endsWith('/'))
      .map(item => ({
        key: item.Key,
        url: `https://${BUCKET_NAME}.s3.amazonaws.com/${item.Key}`,
        size: item.Size,
        lastModified: item.LastModified?.toISOString(),
      }))
      .sort((a, b) => (b.lastModified || '').localeCompare(a.lastModified || ''))

    return NextResponse.json({ images })
  } catch (error) {
    console.error('Error listing images:', error)
    return NextResponse.json({ error: 'Error al listar imágenes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string || 'general'

    if (!file) {
      return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 })
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de archivo no permitido' }, { status: 400 })
    }

    // Validar tamaño (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'El archivo es muy grande (max 10MB)' }, { status: 400 })
    }

    // Convertir a buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Optimizar imagen con Sharp
    const optimizedBuffer = await sharp(buffer)
      .resize(MAX_IMAGE_SIZE, MAX_IMAGE_SIZE, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: QUALITY })
      .toBuffer()

    // Generar nombre único
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 8)
    const key = `gallery/${category}-${timestamp}-${randomId}.webp`

    // Subir a S3
    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: optimizedBuffer,
      ContentType: 'image/webp',
      CacheControl: 'max-age=31536000', // Cache por 1 año
    }))

    const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`

    return NextResponse.json({
      success: true,
      image: {
        key,
        url,
        size: optimizedBuffer.length,
        originalSize: file.size,
        category,
      }
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json({ error: 'Error al subir imagen' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json({ error: 'Key requerido' }, { status: 400 })
    }

    await s3Client.send(new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    }))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json({ error: 'Error al eliminar imagen' }, { status: 500 })
  }
}