/**
 * Contorno della Red Line intorno a Reverse Mountain.
 *
 * Letto a occhio da Claude sulla mappa di riferimento, non generato da un
 * algoritmo: vedi scripts/traccia-red-line.mjs per il perché e il come.
 *
 * Copre solo la fascia immediatamente intorno al passaggio (dove il disegno
 * mostra i quattro bracci del fiume/montagna). Il resto della Red Line — sia
 * il proseguimento lontano da Reverse Mountain, sia la fascia della cucitura
 * del mondo verso Mary Geoise (x = 0 / 10000) — resta un rettangolo semplice
 * in Mappa.tsx: da rifare a mano, un pezzo alla volta, quando si catalogherà
 * ciò che gli sta intorno. Vedi 01-ARCHITETTURA.md.
 *
 * File generato: non modificare a mano. Per rigenerarlo dopo aver corretto
 * uno dei sedici punti in scripts/traccia-red-line.mjs:
 *
 *   node scripts/traccia-red-line.mjs --scrivi
 */
export const CONTORNO_RED_LINE_PRINCIPALE =
  "M 4150 2080 C 4183.3 2090, 4430 2283.3, 4550 2340 C 4670 2396.7, 4745 2440, 4870 2420 C 4995 2400, 5153.3 2293.3, 5300 2220 C 5446.7 2146.7, 5658.3 1991.7, 5750 1980 C 5841.7 1968.3, 5965 2066.7, 5850 2150 C 5735 2233.3, 5118.3 2428.3, 5060 2480 C 5001.7 2531.7, 5335 2456.7, 5500 2460 C 5665 2463.3, 6050 2480, 6050 2500 C 6050 2520, 5675 2556.7, 5500 2580 C 5325 2603.3, 5125 2606.7, 5000 2640 C 4875 2673.3, 4825 2736.7, 4750 2780 C 4675 2823.3, 4611.7 2905, 4550 2900 C 4488.3 2895, 4346.7 2800, 4380 2750 C 4413.3 2700, 4755 2678.3, 4750 2600 C 4745 2521.7, 4450 2366.7, 4350 2280 C 4250 2193.3, 4116.7 2070, 4150 2080 Z";
