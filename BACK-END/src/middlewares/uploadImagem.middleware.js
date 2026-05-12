import createMulter from "../config/upload.Multer.js";

const uploadImage = createMulter({
    pasta: "imagens",
    tiposPermitidos: ["image/png", "image/jpeg"],
    tamanhoArquivo: 10 * 1024 * 1024 // 10MB
}).single("vinculoImagem");

export default uploadImage;