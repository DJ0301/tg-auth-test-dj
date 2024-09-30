import React, { useEffect } from 'react';

const Auth: React.FC = () => {
  useEffect(() => {
    (window as any).onTelegramAuth = function (user: any) {
      alert(`Logged in as ${user.first_name} ${user.last_name} (ID: ${user.id}${user.username ? ', @' + user.username : ''})`);

      fetch('http://localhost:3001/telegram-auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          first_name: user.first_name,
          username: user.username,
        }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.redirectUrl) {
          // Redirect to Telegram channel
          window.location.href = data.redirectUrl;
        } else {
          alert(data.message); // Show message if user is not a member
        }
      })
      .catch(error => console.error('Error:', error));
    };

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', 'WalletXLoginBot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');

    const container = document.getElementById('telegram-login-container');
    container?.appendChild(script);

    return () => {
      if (container?.contains(script)) {
        container.removeChild(script);
      }
    };
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div id="telegram-login-container"></div>
    </div>
  );
};

export default Auth;