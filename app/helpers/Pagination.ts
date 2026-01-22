import type { SimplePaginatorContract } from '@adonisjs/lucid/types/querybuilder'

interface BasePaginator<T> {
  all(): T[]
  perPage: number
  currentPage: number
}

interface FullPaginator<T> extends BasePaginator<T> {
  total: number
  lastPage: number
  firstPage?: number
}

type AnyPaginator<T> = SimplePaginatorContract<T> | FullPaginator<T>

export function pagination<T>(paginator: AnyPaginator<T>) {
  const items = paginator.all()

  const total = 'total' in paginator ? paginator.total : items.length
  const lastPage = 'lastPage' in paginator ? paginator.lastPage : null
  const firstPage = 'firstPage' in paginator ? paginator.firstPage : 1

  const from = (paginator.currentPage - 1) * paginator.perPage + 1
  const to = from + items.length - 1

  return {
    items,
    meta: {
      total,
      per_page: paginator.perPage,
      current_page: paginator.currentPage,
      last_page: lastPage,
      first_page: firstPage,
      from,
      to,
    },
    links: {
      first: `?page=1`,
      last: lastPage ? `?page=${lastPage}` : null,
      next:
        paginator.currentPage < (lastPage ?? paginator.currentPage)
          ? `?page=${paginator.currentPage + 1}`
          : null,
      prev: paginator.currentPage > 1 ? `?page=${paginator.currentPage - 1}` : null,
    },
  }
}
