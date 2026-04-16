import { NextResponse } from 'next/server'

// GET - Listar imágenes de la galería para uso público
export async function GET() {
  try {
    // Esta API será llamada por la página de galería
    // Devuelve las URLs de las imágenes almacenadas en DynamoDB o retorna las URLs directamente
    
    // Por ahora, retornamos un array vacío - las imágenes se cargan desde el admin
    // En producción, esto podría leer de DynamoDB o directamente de S3
    
    return NextResponse.json({ images: [] })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}