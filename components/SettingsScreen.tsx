'use client';

import { useState } from 'react';
import { signOut, updateProfile, resetPassword, AuthUser } from '@/lib/auth';
import { Card, Header, Button } from '@/components/ui/DesignSystem';
import { LogOut, User, Mail, Key, AlertTriangle } from 'lucide-react';

interface SettingsScreenProps {
  user: AuthUser | null;
  onBack: () => void;
  onAlert: (msg: string) => void;
}

export default function SettingsScreen({ user, onBack, onAlert }: SettingsScreenProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdateUsername = async () => {
    if (!user || !username.trim()) {
      onAlert('Ingresa un nombre de usuario');
      return;
    }
    
    setLoading(true);
    const { error } = await updateProfile(user.id, { username: username.trim() });
    setLoading(false);
    
    if (error) {
      onAlert('Error al actualizar: ' + error);
    } else {
      onAlert('Nombre actualizado!');
      setUsername('');
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      onAlert('Ingresa tu email');
      return;
    }
    
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    
    if (error) {
      onAlert('Error: ' + error);
    } else {
      onAlert('Email de recuperación enviado!');
      setShowResetPassword(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    await signOut();
    setLoading(false);
    onBack();
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <Header title="Configuración" icon="⚙️" onBack={onBack} />
      
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* Profile Section */}
        <Card className="p-4 space-y-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <User size={18} className="text-amber-400" />
            Perfil
          </h3>
          
          <div>
            <label className="text-xs text-zinc-400">Nombre de usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={user?.username || 'Nuevo nombre'}
              className="w-full mt-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm"
            />
            {username && (
              <Button 
                onClick={handleUpdateUsername}
                disabled={loading}
                className="mt-2 w-full"
              >
                {loading ? 'Guardando...' : 'Cambiar nombre'}
              </Button>
            )}
          </div>
        </Card>

        {/* Account Section */}
        <Card className="p-4 space-y-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Mail size={18} className="text-amber-400" />
            Cuenta
          </h3>
          
          <div className="text-sm text-zinc-400">
            <p>Email: {user?.email || 'No registrado'}</p>
          </div>
          
          {!showResetPassword ? (
            <Button 
              variant="secondary"
              onClick={() => setShowResetPassword(true)}
              className="w-full"
            >
              <Key size={16} className="mr-2" />
              Recuperar contraseña
            </Button>
          ) : (
            <div className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tu email"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm"
              />
              <div className="flex gap-2">
                <Button 
                  onClick={handleResetPassword}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Enviando...' : 'Enviar email'}
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => setShowResetPassword(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Danger Zone */}
        <Card className="p-4 space-y-4 border-red-900/50">
          <h3 className="font-bold text-red-400 flex items-center gap-2">
            <AlertTriangle size={18} />
            Zona de peligro
          </h3>
          
          <Button 
            variant="danger"
            onClick={handleSignOut}
            disabled={loading}
            className="w-full"
          >
            <LogOut size={16} className="mr-2" />
            {loading ? 'Cerrando sesión...' : 'Cerrar sesión'}
          </Button>
        </Card>

        {/* App Info */}
        <Card className="p-4">
          <p className="text-xs text-zinc-500 text-center">
            Braveclon v0.1.0<br />
            Powered by Supabase
          </p>
        </Card>
      </div>
    </div>
  );
}