'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { transfer } from '@/service/spotify/transfer';

export function Transfer() {
  const [status, setStatus] = useState<string | null>(null);

  if (status === 'done') {
    return <div>Transfer complete</div>;
  }

  if (status === 'transferring') {
    return <div>transferring....</div>;
  }

  if (status === 'error') {
    return <div>Oops something went wrong.</div>;
  }

  return (
    <>
      <Button
        onClick={async () => {
          setStatus('transferring');
          try {
            await transfer();
            setStatus('done');
          } catch (e) {
            console.error(e);
            setStatus('error');
          }
        }}
      >
        Transfer
      </Button>
    </>
  );
}
