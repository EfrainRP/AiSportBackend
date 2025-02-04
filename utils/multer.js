import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Obtener el directorio actual con import.meta.url
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Configuración de almacenamiento de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Usar path.resolve() para obtener la ruta correcta
        let uploadPath = path.resolve(__dirname, 'uploads'); // Obtiene la ruta absoluta <-
        
        // Normaliza la ruta para evitar que esta se duplique <-
        uploadPath = uploadPath.replace(/^C:\\C:\\/, 'C:\\'); // Reemplaza "C:\C:\" por "C:\"

        console.log("DESTINATION DONE", uploadPath); // Verifica que la ruta sea correcta

        // Verificar si la carpeta 'uploads' existe, y si no, la crea
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true }); // Crea la carpeta si no existe
        }

        cb(null, uploadPath); // Ruta corregida no duplicada <-
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        console.log("NOMBRE DONE ");
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});

// Filtros para tipos de archivos permitidos
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    console.log("FILTER ENTERED <-");
    if (allowedTypes.includes(file.mimetype)) {
        console.log("FILTER DONE");
        cb(null, true);
    } else {
        // field image
        cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes con formato JPEG, JPG o PNG.'));
    }
};

// Inicializar Multer que se llamará antes de entrar al controlador y después del Front <-
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Tamaño máximo: 5MB y para 20 MB = { fileSize: 20 * 1024 * 1024 }
});

// Retorna el "Error" de la IMG en caso de que sea más grande de 5MB <-
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                field: 'image',
                message: 'La imagen es demasiado grande, el máximo permitido para una foto de perfil es de 20.MB'
            });
        }
    } else if (err.message === 'Tipo de archivo no permitido. Solo se permiten imágenes con formato JPEG, JPG o PNG.') {
        return res.status(400).json({
            field: 'image',
            message: 'Solo se permiten imágenes con formato JPEG, JPG o PNG'
        });
    }

    // Manejar otros errores de Multer
    return res.status(400).json({ message: `Error de en la carga de archivo: ${err.message}` });
};

export { upload, handleMulterError };
