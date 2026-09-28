import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 4000;

// Setup directories
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Multer memory storage so Sharp can process the buffer directly in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB max upload limit
});

/**
 * Image optimization endpoint using SHARP
 * - Converts image to modern WebP format
 * - Resizes high-res phone pictures (max 1600x1600)
 * - Compresses with quality 80
 * - Drastically reduces weight (often >80% weight reduction)
 */
app.post('/api/upload/image', upload.single('image'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No se subió ninguna imagen' });
      return;
    }

    const originalSize = req.file.size;
    const timestamp = Date.now();
    const cleanOriginalName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const baseName = path.parse(cleanOriginalName).name;
    const outputFilename = `${baseName}_${timestamp}.webp`;
    const outputPath = path.join(uploadsDir, outputFilename);

    // Sharp optimization pipeline
    const optimizedBuffer = await sharp(req.file.buffer)
      .resize({
        width: 1600,
        height: 1600,
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 80, effort: 4 })
      .toBuffer();

    // Write optimized file
    await fs.promises.writeFile(outputPath, optimizedBuffer);
    const optimizedSize = optimizedBuffer.length;
    const savedPercentage = Math.round(((originalSize - optimizedSize) / originalSize) * 100);

    const fileUrl = `/uploads/${outputFilename}`;

    res.json({
      success: true,
      message: 'Imagen procesada y optimizada con Sharp exitosamente',
      file: {
        filename: outputFilename,
        url: fileUrl,
        originalSizeKb: (originalSize / 1024).toFixed(1),
        optimizedSizeKb: (optimizedSize / 1024).toFixed(1),
        savedPercentage: `${savedPercentage}%`,
        format: 'webp'
      }
    });
  } catch (error: any) {
    console.error('Error procesando imagen con Sharp:', error);
    res.status(500).json({ error: 'Error al optimizar la imagen con Sharp', details: error.message });
  }
});

// Healthcheck
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    version: '1.0.0',
    library: 'Sharp v' + sharp.versions.sharp,
    timestamp: new Date().toISOString()
  });
});

// Production: Serve Frontend SPA build if present (for single container deployment in Coolify/VPS)
const clientDistCandidates = [
  path.resolve(process.cwd(), '..', 'client', 'dist'),
  path.resolve(process.cwd(), 'client-dist'),
  path.resolve(process.cwd(), 'public')
];

for (const candidate of clientDistCandidates) {
  if (fs.existsSync(candidate) && fs.existsSync(path.join(candidate, 'index.html'))) {
    app.use(express.static(candidate));
    app.get('*', (req: Request, res: Response, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
        return next();
      }
      res.sendFile(path.join(candidate, 'index.html'));
    });
    console.log(`📦 Sirviendo Frontend estático desde: ${candidate}`);
    break;
  }
}

app.listen(PORT, () => {
  console.log(`🚀 Backend PF corriendo en puerto ${PORT}`);
  console.log(`📁 Carpeta de uploads: ${uploadsDir}`);
  console.log(`✨ Sharp listo para optimizar y reducir peso de imágenes`);
});
