import type { ProyectoRepository } from '@modules/proyectos/domain/types'

export function listProyectosUseCase(repository: ProyectoRepository) {
  return repository.list()
}

export function getProyectoUseCase(repository: ProyectoRepository, id: string) {
  return repository.getById(id)
}

export function saveProyectoUseCase(
  repository: ProyectoRepository,
  proyecto: Parameters<ProyectoRepository['save']>[0],
) {
  return repository.save(proyecto)
}

export function removeProyectoUseCase(repository: ProyectoRepository, id: string) {
  return repository.remove(id)
}
