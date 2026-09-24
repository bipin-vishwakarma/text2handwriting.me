export interface ConnectionHints {
    saveData?: boolean;
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
}

/** Browser estimates, not a speed test. Unknown connections remain lightweight. */
export function shouldAutoLoadNotebook(connection: ConnectionHints | undefined, online: boolean, reducedMotion: boolean): boolean {
    if (!online || reducedMotion || !connection || connection.saveData) return false;
    return connection.effectiveType === '4g'
        && typeof connection.downlink === 'number' && connection.downlink >= 5
        && (connection.rtt === undefined || connection.rtt <= 150);
}
