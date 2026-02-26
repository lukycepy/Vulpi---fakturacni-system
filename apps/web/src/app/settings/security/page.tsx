'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';

import { startRegistration } from '@simplewebauthn/browser';

export default function SecurityPage() {
  const { currentOrg } = useOrganization();
  const [ips, setIps] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Passkeys State
  const [passkeys, setPasskeys] = useState<any[]>([]);

  // 2FA State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    // Fetch user 2FA status
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        setTwoFactorEnabled(data.twoFactorEnabled);
      })
      .catch(err => console.error(err));

    // Fetch passkeys
    fetch('/api/auth/webauthn/credentials')
      .then(res => res.json())
      .then(data => {
          if (Array.isArray(data)) setPasskeys(data);
      })
      .catch(err => console.error(err));
  }, []);

  const registerPasskey = async () => {
    try {
        const resp = await fetch('/api/auth/webauthn/register/options', {
            method: 'POST',
        });
        const options = await resp.json();

        const attResp = await startRegistration(options);

        const verificationResp = await fetch('/api/auth/webauthn/register/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(attResp),
        });

        if (verificationResp.ok) {
            alert('Passkey úspěšně přidán!');
            // Refresh list
            const list = await fetch('/api/auth/webauthn/credentials').then(r => r.json());
            if (Array.isArray(list)) setPasskeys(list);
        } else {
            alert('Chyba při registraci Passkey.');
        }
    } catch (e) {
        console.error(e);
        alert('Chyba: ' + e);
    }
  };

  const deletePasskey = async (id: string) => {
    if(!confirm('Opravdu smazat tento klíč?')) return;
    try {
        await fetch(`/api/auth/webauthn/credentials/${id}`, { method: 'DELETE' });
        setPasskeys(passkeys.filter(p => p.id !== id));
    } catch (e) {
        alert('Chyba při mazání.');
    }
  };

  const generate2FA = async () => {
    try {
      const res = await fetch('/api/auth/2fa/generate', { method: 'POST' });
      const data = await res.json();
      setSecret(data.secret);
      // Use the generated data URL from backend
      setQrCode(data.qrCodeDataUrl);
      setShowSetup(true);
    } catch (e) {
      alert('Chyba při generování 2FA.');
    }
  };

  const enable2FA = async () => {
    try {
      const res = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationCode }),
      });
      
      if (!res.ok) throw new Error();

      setTwoFactorEnabled(true);
      setShowSetup(false);
      alert('2FA úspěšně zapnuto.');
    } catch (e) {
      alert('Neplatný kód.');
    }
  };

  const disable2FA = async () => {
    if (!confirm('Opravdu chcete vypnout 2FA? Váš účet bude méně zabezpečený.')) return;
    
    try {
      await fetch('/api/auth/2fa/disable', { method: 'POST' });
      setTwoFactorEnabled(false);
      alert('2FA vypnuto.');
    } catch (e) {
      alert('Chyba při vypínání 2FA.');
    }
  };

  useEffect(() => {
    if (currentOrg && currentOrg.allowedIps) {
        setIps(currentOrg.allowedIps.join('\n'));
    }
  }, [currentOrg]);

  const saveIps = async () => {
      setLoading(true);
      const ipList = ips.split('\n').map(ip => ip.trim()).filter(ip => ip);
      
      try {
          await fetch('/api/security/ips', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  organizationId: currentOrg?.id,
                  ips: ipList
              })
          });
          alert('Uloženo.');
      } catch (e) {
          alert('Chyba při ukládání.');
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Zabezpečení</h1>

      {/* 2FA Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>🔐</span> Dvoufázové ověření (2FA)
          </h2>
          <p className="text-gray-500 mb-4 text-sm">
              Zvyšte bezpečnost svého účtu pomocí 2FA. Při přihlášení budete vyzváni k zadání kódu z aplikace Google Authenticator.
          </p>

          {twoFactorEnabled ? (
              <div className="flex items-center gap-4">
                  <span className="text-green-600 font-bold">✅ Aktivní</span>
                  <button 
                      onClick={disable2FA}
                      className="text-red-600 hover:underline text-sm"
                  >
                      Vypnout
                  </button>
              </div>
          ) : (
              <div>
                  {!showSetup ? (
                      <button 
                          onClick={generate2FA}
                          className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700"
                      >
                          Nastavit 2FA
                      </button>
                  ) : (
                      <div className="space-y-4">
                          <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded flex flex-col items-center">
                              <p className="mb-2 text-sm font-bold">Naskenujte QR kód:</p>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={qrCode} alt="QR Code" className="w-48 h-48 bg-white p-2 rounded" />
                              <p className="mt-2 text-xs text-gray-500 break-all">Secret: {secret}</p>
                          </div>
                          
                          <div className="flex gap-2">
                              <input 
                                  type="text" 
                                  placeholder="Kód (123456)" 
                                  value={verificationCode}
                                  onChange={e => setVerificationCode(e.target.value)}
                                  className="border p-2 rounded"
                              />
                              <button 
                                  onClick={enable2FA}
                                  className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700"
                              >
                                  Ověřit a zapnout
                              </button>
                          </div>
                      </div>
                  )}
              </div>
          )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>🔑</span> Passkeys (FIDO2 / WebAuthn)
          </h2>
          <p className="text-gray-500 mb-4 text-sm">
              Přihlaste se bezpečně pomocí otisku prstu, FaceID nebo hardwarového klíče (Yubikey).
          </p>

          <div className="space-y-4">
              {passkeys.map((pk) => (
                  <div key={pk.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                      <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                              {pk.transports ? pk.transports.join(', ') : 'Neznámé zařízení'}
                          </p>
                          <p className="text-xs text-gray-500">
                              Přidáno: {new Date(pk.createdAt).toLocaleDateString()}
                          </p>
                      </div>
                      <button
                          onClick={() => deletePasskey(pk.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-semibold"
                      >
                          Odstranit
                      </button>
                  </div>
              ))}

              <button
                  onClick={registerPasskey}
                  className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded font-bold hover:bg-purple-700"
              >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Přidat nový Passkey
              </button>
          </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-red-500">🛡️</span> IP Whitelist (IP Zámek)
          </h2>
          <p className="text-gray-500 mb-4 text-sm">
              Zadejte IP adresy, ze kterých je povolen přístup k této organizaci. Pokud necháte prázdné, přístup je povolen odkudkoliv.
              <br />Každou adresu na nový řádek.
          </p>

          <textarea 
              value={ips}
              onChange={e => setIps(e.target.value)}
              className="w-full border p-4 rounded h-48 font-mono text-sm mb-4"
              placeholder="192.168.1.1&#10;8.8.8.8"
          />

          <button 
              onClick={saveIps}
              disabled={loading}
              className="bg-red-600 text-white px-6 py-2 rounded font-bold hover:bg-red-700 disabled:opacity-50"
          >
              {loading ? 'Ukládám...' : 'Uložit bezpečnostní pravidla'}
          </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow opacity-50 cursor-not-allowed">
          <h2 className="text-xl font-bold mb-4">🔐 Vault (Šifrované klíče)</h2>
          <p className="text-gray-500">
              API klíče k bankám a certifikáty jsou bezpečně šifrovány (AES-256).
              Tato sekce je spravována automaticky při integraci.
          </p>
      </div>
    </div>
  );
}
