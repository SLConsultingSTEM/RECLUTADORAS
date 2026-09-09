import { env } from '@shared/config/env'
import type { ProyectoRepository } from '@modules/proyectos/domain/types'
import { ApiProyectoRepository } from '@modules/proyectos/infrastructure/ApiProyectoRepository'
import { MockProyectoRepository } from '@modules/proyectos/infrastructure/MockProyectoRepository'

export function createProyectoRepository(): ProyectoRepository {
  return env.useMock ? new MockProyectoRepository() : new ApiProyectoRepository()
}
