import { useEffect, useState } from "react";
import { getAdega } from "../services/personService";

export function useBebidas() {
  const [bebidas, setBebidas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBebidas() {
      try {
        const data = await getAdega();

        setBebidas(data);
      } catch (error) {
        console.log("Erro ao buscar personagens", error);
      } finally {
        setLoading(false);
      }
    }

    loadBebidas();
  }, []);

  return { bebidas, loading };
}
