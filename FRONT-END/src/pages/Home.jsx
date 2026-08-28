import { useProdutos } from "../hooks/useProdutos"
import ProdutoList from "../components/ProdutoList";
import SkeletonLoading from "../components/SkeletonLoading";
import { Link } from "react-router-dom";

export default function Home() {
  const { produtos, loading } = useProdutos();

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Catálogo de Pessoas</h1>

      <Link to="/login" className="btn btn-secondary mb-3">
        Ir para Login
      </Link>

      {loading ? <SkeletonLoading /> : <PersonList produtos={produtos} />}
    </div>
  );
}