import { Link } from 'react-router-dom'
import { ROUTES } from '@/app/paths'
import { useI18n } from '@/i18n'

/** 客户端未知路径；Pages 深链刷新靠构建产物 404.html → index */
export function NotFoundPage() {
  const { m } = useI18n()

  return (
    <div className="not-found-screen">
      <h1>{m.notFound.title}</h1>
      <p>{m.notFound.body}</p>
      <Link className="btn btn-primary" to={ROUTES.home}>
        {m.notFound.home}
      </Link>
    </div>
  )
}
