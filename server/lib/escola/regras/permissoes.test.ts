import { describe, it, expect } from 'vitest'
import type { AuthUser } from '@/lib/db'
import {
    assertPermissao,
    canCreateAluno,
    canDeleteAluno,
    canLancarNotas,
    canManageHorarios,
    canCreateComunicado,
    canDeleteComunicado,
    canViewDashboard,
    canViewAuditLog,
    canRegistarFrequencia,
    isResponsavel,
    isAluno,
    isProfessor,
    isAdmin,
} from '../permissoes'

function makeUser(papel: AuthUser['papel']): AuthUser {
    return { userId: 'user-1', pessoaId: 'pessoa-1', escolaId: 'escola-1', papel }
}

describe('permissoes', () => {
    describe('assertPermissao', () => {
        it('não lança se papel está incluído', () => {
            expect(() => assertPermissao(makeUser('admin'), ['admin'], 'teste')).not.toThrow()
        })
        it('lança se papel não está incluído', () => {
            expect(() => assertPermissao(makeUser('aluno'), ['admin'], 'teste')).toThrow('Sem permissão')
        })
    })

    describe('alunos', () => {
        it('admin pode criar/eliminar alunos', () => {
            expect(canCreateAluno(makeUser('admin'))).toBe(true)
            expect(canDeleteAluno(makeUser('admin'))).toBe(true)
        })
        it('direcao pode criar/eliminar alunos', () => {
            expect(canCreateAluno(makeUser('direcao'))).toBe(true)
            expect(canDeleteAluno(makeUser('direcao'))).toBe(true)
        })
        it('professor não pode criar/eliminar alunos', () => {
            expect(canCreateAluno(makeUser('professor'))).toBe(false)
            expect(canDeleteAluno(makeUser('professor'))).toBe(false)
        })
    })

    describe('notas', () => {
        it('admin/direcao/professor podem lançar notas', () => {
            expect(canLancarNotas(makeUser('admin'))).toBe(true)
            expect(canLancarNotas(makeUser('direcao'))).toBe(true)
            expect(canLancarNotas(makeUser('professor'))).toBe(true)
        })
        it('aluno/responsavel não podem lançar notas', () => {
            expect(canLancarNotas(makeUser('aluno'))).toBe(false)
            expect(canLancarNotas(makeUser('responsavel'))).toBe(false)
        })
    })

    describe('horarios', () => {
        it('apenas admin/direcao podem gerir horários', () => {
            expect(canManageHorarios(makeUser('admin'))).toBe(true)
            expect(canManageHorarios(makeUser('direcao'))).toBe(true)
            expect(canManageHorarios(makeUser('professor'))).toBe(false)
            expect(canManageHorarios(makeUser('aluno'))).toBe(false)
        })
    })

    describe('comunicados', () => {
        it('gestão pode criar comunicados', () => {
            expect(canCreateComunicado(makeUser('admin'))).toBe(true)
            expect(canCreateComunicado(makeUser('professor'))).toBe(true)
        })
        it('aluno não pode criar comunicados', () => {
            expect(canCreateComunicado(makeUser('aluno'))).toBe(false)
        })
        it('admin pode eliminar qualquer comunicado', () => {
            expect(canDeleteComunicado(makeUser('admin'), 'outro-user')).toBe(true)
        })
        it('professor só pode eliminar seus próprios', () => {
            expect(canDeleteComunicado(makeUser('professor'), 'user-1')).toBe(true)
            expect(canDeleteComunicado(makeUser('professor'), 'outro-user')).toBe(false)
        })
    })

    describe('frequencia', () => {
        it('gestão pode registar frequência', () => {
            expect(canRegistarFrequencia(makeUser('admin'))).toBe(true)
            expect(canRegistarFrequencia(makeUser('professor'))).toBe(true)
        })
        it('aluno não pode registar frequência', () => {
            expect(canRegistarFrequencia(makeUser('aluno'))).toBe(false)
        })
    })

    describe('dashboard e audit', () => {
        it('gestão pode ver dashboard', () => {
            expect(canViewDashboard(makeUser('admin'))).toBe(true)
            expect(canViewDashboard(makeUser('professor'))).toBe(true)
        })
        it('apenas admin pode ver audit log', () => {
            expect(canViewAuditLog(makeUser('admin'))).toBe(true)
            expect(canViewAuditLog(makeUser('direcao'))).toBe(true)
            expect(canViewAuditLog(makeUser('professor'))).toBe(false)
        })
    })

    describe('identity checks', () => {
        it('identifica papéis corretamente', () => {
            expect(isAdmin(makeUser('admin'))).toBe(true)
            expect(isAdmin(makeUser('professor'))).toBe(false)
            expect(isProfessor(makeUser('professor'))).toBe(true)
            expect(isAluno(makeUser('aluno'))).toBe(true)
            expect(isResponsavel(makeUser('responsavel'))).toBe(true)
        })
    })
})
