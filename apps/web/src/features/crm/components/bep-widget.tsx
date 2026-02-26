
export function BepWidget({ bep }: { bep: any }) {
    if (!bep) return null;

    return (
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-6 rounded-lg shadow mb-8 flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold mb-2">Bod Zvratu (Break Even Point)</h2>
                <p className="opacity-90">Aby byla firma tento měsíc v zisku, musíte ještě vyfakturovat:</p>
            </div>
            <div className="text-right">
                <div className="text-3xl font-bold">{Math.max(0, bep.remainingRevenue).toFixed(0)} CZK</div>
                <div className="text-sm opacity-80">
                    Fixní náklady: {bep.fixedCosts.toFixed(0)} CZK / měsíc
                </div>
                <div className="mt-2 w-48 bg-white/20 rounded-full h-2">
                    <div 
                        className="bg-white h-2 rounded-full" 
                        style={{ width: `${Math.min(100, (bep.currentRevenue / bep.fixedCosts) * 100)}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
}
