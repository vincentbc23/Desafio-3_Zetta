# API Examples

Exemplos de integração do frontend React com backend Node.js + Express.

## Exemplo 1 — usando `useApi` (recomendado)

```tsx
import { useApi } from '@/app/api/useApi';

interface CardInfo {
  id: number;
  titulo: string;
  valor: number | string;
  icon: string;
}

export function Dados() {
  const { data: cards, loading, error } = useApi<CardInfo[]>('/api/cards');

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;

  return (
    <div>
      {cards?.map((card) => (
        <CardInformacao key={card.id} {...card} />
      ))}
    </div>
  );
}
```

## Exemplo 2 — usando o cliente diretamente

```tsx
import { useEffect, useState } from 'react';
import { api } from '@/app/api/client';

export function Home() {
  const [data, setData] = useState<unknown>(null);

  useEffect(() => {
    api.get('/api/dados').then(setData);
  }, []);

  return <div>{/* conteúdo */}</div>;
}
```

## Exemplo 3 — POST

```tsx
import { api } from '@/app/api/client';

export function Reportar() {
  const handleSubmit = async (formData: unknown) => {
    try {
      const response = await api.post('/api/reports', formData);
      console.log('Reporte enviado:', response);
    } catch (error) {
      console.error('Erro ao enviar reporte:', error);
    }
  };

  return null;
}
```
