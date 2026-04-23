# API Examples

Exemplos de integração do frontend React com backend Node.js + Express.

## Endpoints oficiais (fase atual)

- `POST /api/reportar`
- `GET /api/cards`
- `GET /api/dados`
- `GET /api/ml/status`

Compatibilidade mantida:

- `POST /api/reports/ingest` (equivalente a `POST /api/reportar`)

## Exemplo 1 — usando `useApi` (recomendado)

```tsx
import { useApi } from '@/app/api/useApi';

interface CardInfo {
  id: string;
  titulo: string;
  valor: number | string;
  icon: string;
}

export function Dados() {
  const { data, loading, error, refreshing, refetch } = useApi<{
    cards: CardInfo[];
    updatedAt: string;
  }>('/api/cards', [], 30000);

  const cards = data?.cards ?? [];

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;

  return (
    <div>
      <button onClick={() => void refetch()} disabled={refreshing}>
        {refreshing ? 'Atualizando...' : 'Atualizar agora'}
      </button>
      {cards?.map((card) => (
        <CardInformacao key={card.id} titulo={card.titulo} valor={card.valor} />
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
      const response = await api.post<{
        reportId: string;
        ml: { classePrevista: string; probIncendio: number };
      }>('/api/reportar', formData);

      console.log('ID:', response.reportId);
      console.log('Classe:', response.ml.classePrevista);
    } catch (error) {
      console.error('Erro ao enviar reporte:', error);
    }
  };

  return null;
}
```
