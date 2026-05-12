import multer from "multer"; // lidar com uploads de arquivos
import path from "path"; // lidar com caminhos de arquivos
import crypto from "crypto"; // gerar nomes de arquivos únicos
import fs from "fs"; // lidar com o sistema de arquivos

const baseUploadDir = path.resolve(process.cwd(), "uploads");

const verificarDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const createMulter = ({ pasta, tiposPermitidos, tamanhoArquivo}) => {
    const pastaFinal = path.join(baseUploadDir, pasta);
    verificarDir(pastaFinal);

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, pastaFinal);
        },
        filename: (req, file, cb) => {

            const hash = crypto.randomBytes(12).toString("hex");
            cb(null, `${hash}-${file.originalname}`);
        }
    });

    const fileFilter = (req, file, cb) => {
        if (!tiposPermitidos.includes(file.mimetype)) {
            return cb(new Error("Tipo de arquivo não permitido"), false);
        }
        cb(null, true);
    }

    return multer({
    storage,
    limits: { fileSize: tamanhoArquivo },
    fileFilter
    });
}

export default createMulter;