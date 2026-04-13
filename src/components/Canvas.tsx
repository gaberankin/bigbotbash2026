import { useEffect, useRef, useState } from 'react'
import bigBotBashImage from '../assets/bigbotbash2026.jpg'

type ImageSize = { width: number; height: number }

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}

export function BotBashCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageSize, setImageSize] = useState<ImageSize | null>(null)

  useEffect(() => {
    let isMounted = true

    const drawImage = async () => {
      setLoading(true)
      setError(null)

      try {
        const image = await loadImage(bigBotBashImage)
        await image.decode()

        if (!isMounted || !canvasRef.current) {
          return
        }

        const width = image.naturalWidth
        const height = image.naturalHeight
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')

        if (!context) {
          throw new Error('Could not get canvas 2D context')
        }

        canvas.width = width
        canvas.height = height
        context.clearRect(0, 0, width, height)
        context.drawImage(image, 0, 0)
        setImageSize({ width, height })
      } catch (err) {
        if (!isMounted) {
          return
        }
        setError(err instanceof Error ? err.message : 'Unknown image loading error')
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    drawImage()

    return () => {
      isMounted = false
    }
  }, [])

  return (
      <>
        {loading && (
          <div className="absolute inset-0 grid place-items-center text-sm text-slate-300">
            Loading image...
          </div>
        )}

        {!loading && error && <p className="text-sm text-red-300">{error}</p>}

        <canvas ref={canvasRef} className={loading || error ? 'invisible' : 'block'} />
      </>
  )
}
