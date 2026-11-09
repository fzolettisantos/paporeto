import { Fragment } from "react";
import { formatNumber } from "@/lib/ranking";
import type { BalaShot } from "@/types";

export const shotsTotal = (shots: BalaShot[]) => shots.reduce((total, s) => total + s.quantity, 0);
export const shotsLabel = (n: number) => `${formatNumber(n)} ${n === 1 ? "tiro" : "tiros"}`;

const Empty = () => (
  <span className="text-muted" aria-label="não informado">
    —
  </span>
);

/**
 * Tabela de tiros do Bala do Véio no box de cada participante (cabe em 360px, sem rolagem lateral).
 * Colunas sem nenhum dado no box (ex.: tipo de arma) não aparecem; o motivo vai numa linha abaixo do registro.
 */
export function ShotsTable({ shots, name }: { shots: BalaShot[]; name: string }) {
  const total = shotsTotal(shots);
  const showPlace = shots.some((s) => s.place);
  const showWeapon = shots.some((s) => s.weapon);
  const columns = 2 + Number(showPlace) + Number(showWeapon);
  const cell = "break-words hyphens-auto px-2 py-2";

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-line">
      <table className="w-full table-fixed text-left text-[12px] leading-snug sm:text-[13px]">
        <caption className="sr-only">Tiros em {name}</caption>
        <thead className="bg-surface-2 text-[11px] font-extrabold uppercase tracking-wide text-muted">
          <tr>
            <th scope="col" className="w-[15%] px-2 py-2">Tiros</th>
            <th scope="col" className="px-2 py-2">Local do tiro</th>
            {showPlace ? <th scope="col" className="px-2 py-2">Localidade</th> : null}
            {showWeapon ? <th scope="col" className="px-2 py-2">Tipo de arma</th> : null}
          </tr>
        </thead>
        <tbody>
          {shots.length === 0 ? (
            <tr className="border-t border-line">
              <td colSpan={columns} className="px-2 py-2.5 text-muted">Nenhum tiro registrado. Por enquanto.</td>
            </tr>
          ) : (
            shots.map((shot) => (
              <Fragment key={shot.id}>
                <tr className="border-t border-line align-top">
                  <td className="px-2 py-2 font-display text-[17px] leading-none tabular text-yellow">{formatNumber(shot.quantity)}</td>
                  <td className={`${cell} font-semibold`}>{shot.location || <Empty />}</td>
                  {showPlace ? <td className={cell}>{shot.place || <Empty />}</td> : null}
                  {showWeapon ? <td className={`${cell} text-muted`}>{shot.weapon || <Empty />}</td> : null}
                </tr>
                {shot.note ? (
                  <tr>
                    <td colSpan={columns} className="px-2 pb-2 pt-0 text-[12px] italic leading-snug text-muted">
                      <span className="sr-only">Motivo: </span>
                      {shot.note}
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            ))
          )}
        </tbody>
        <tfoot className="border-t-2 border-line bg-surface-2">
          <tr>
            <td colSpan={columns} className="px-2 py-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wide text-muted">Total de tiros</span>
                <span className="font-display text-xl leading-none tabular text-white">{formatNumber(total)}</span>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
