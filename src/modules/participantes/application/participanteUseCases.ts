import { createParticipanteRepository } from '@modules/participantes/infrastructure/participanteRepositoryFactory'
import type {
  ParticipanteRepository,
  RegistrarParticipanteInput,
  SeguimientoResumen,
} from '@modules/participantes/domain/types'
import { computeSeguimientoResumen } from '@modules/participantes/application/seguimientoResumen'
import { listParticipantesCached } from '@modules/participantes/infrastructure/participanteListCache'

export function listParticipantesUseCase(
  repository: ParticipanteRepository,
  filters?: { proyectoId?: string; estado?: string },
) {
  return repository.list(filters)
}

const mayusculas = (valor: string) => valor.trim().toLocaleUpperCase('es-CO')

/**
 * Los datos del participante viajan en mayúsculas. Los correos (campos de tipo
 * email, por su nombreCampo) se dejan como se escribieron.
 */
export function datosEnMayusculas(
  input: RegistrarParticipanteInput,
  camposCorreo: ReadonlySet<string> = new Set(),
): RegistrarParticipanteInput {
  const base = (campo: 'nombre' | 'tipoDocumento' | 'documento' | 'genero' | 'ciudad') =>
    camposCorreo.has(campo) ? input[campo].trim() : mayusculas(input[campo])

  return {
    ...input,
    nombre: base('nombre'),
    tipoDocumento: base('tipoDocumento'),
    documento: base('documento'),
    genero: base('genero'),
    ciudad: base('ciudad'),
    telefonos: input.telefonos.map(mayusculas),
    camposExtra: Object.fromEntries(
      Object.entries(input.camposExtra).map(([campo, valor]) => [
        campo,
        camposCorreo.has(campo) ? valor.trim() : mayusculas(valor),
      ]),
    ),
    ...(input.observaciones !== undefined
      ? { observaciones: mayusculas(input.observaciones) }
      : {}),
  }
}

export function registerParticipanteUseCase(
  repository: ParticipanteRepository,
  input: RegistrarParticipanteInput,
  camposCorreo?: ReadonlySet<string>,
) {
  return repository.register(datosEnMayusculas(input, camposCorreo))
}

export async function getSeguimientoResumenUseCase(
  repository: ParticipanteRepository,
  proyectoId?: string,
): Promise<SeguimientoResumen> {
  const items = proyectoId
    ? await listParticipantesCached(repository, proyectoId)
    : await repository.list()

  return computeSeguimientoResumen(items)
}

/**
 * Opciones del filtro de la coordinadora. Solo la implementación HTTP las
 * conoce; con mocks la lista queda vacía y el filtro no se muestra.
 */
export async function listReclutadorasUseCase(): Promise<string[]> {
  const repository = createParticipanteRepository()
  const listar = (repository as { listReclutadoras?: () => Promise<string[]> })
    .listReclutadoras
  if (!listar) return []
  return listar.call(repository)
}
