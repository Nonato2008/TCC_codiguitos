import { connection } from "../config/Database.js";

const proprietarioRepository = {

    criar: async (proprietario) => {    
        const conn = await connection.getConnection();

    }
}

export default proprietarioRepository;