# Relatório de Análise Exploratória de Dados (EDA) - Focos de Incêndio no Cerrado Mineiro

## Introdução

Este relatório apresenta um resumo da Análise Exploratória de Dados (EDA) realizada sobre os dados de focos de incêndio no bioma Cerrado de Minas Gerais, Brasil. A análise foi conduzida utilizando o notebook `eda_cerrado_mineiro.ipynb`, com foco em entender a distribuição temporal, espacial e as correlações entre variáveis meteorológicas e de risco de fogo.

Os dados foram carregados a partir do arquivo `bdqueimadas_final.parquet`, contendo informações sobre queimadas, incluindo localização, data/hora, condições meteorológicas e indicadores de risco.

## Carregamento e Visão Geral dos Dados

### Bibliotecas Utilizadas
- `pandas` e `numpy`: Manipulação de dados
- `matplotlib` e `seaborn`: Visualizações
- `geopandas` e `geobr`: Análises geoespaciais

### Estrutura dos Dados
- **Forma do dataset**: (linhas, colunas) - conforme exibido no notebook
- **Colunas principais**: Estado, Municipio, Bioma, DataHora, Temperatura_C, Umidade_Relativa_%, Vento_ms, FRP, RiscoFogo, etc.
- **Tipos de dados**: Mistura de categóricos (strings) e numéricos (floats/ints)
- **Informações gerais**: Uso de `df.info()` para verificar tipos e valores nulos

### Distribuição por Estado e Bioma
- Quantidade de dados por estado: MG lidera com a maioria dos registros
- Biomas no dataset: Cerrado é o foco, mas outros como Mata Atlântica estão presentes
- Total de registros no Cerrado: X (cerca de Y% do total)

## Filtragem e Análise Inicial do Cerrado

### Filtragem
- Criado `df_cerrado` filtrando apenas registros onde `Bioma == 'Cerrado'`
- Estados envolvidos: Principalmente MG

### Estatísticas Descritivas
- `df_cerrado.describe()`: Médias, desvios, mínimos/máximos para variáveis numéricas
- Valores nulos: Verificados por coluna, com foco em variáveis críticas como Temperatura, Umidade, Vento, FRP, RiscoFogo

### Distribuições
- Histogramas para Temperatura_C, Umidade_Relativa_%, Vento_ms: Identificação de outliers (e.g., umidade negativa ou >100%, temperaturas irreais)

## Análise Temporal

### Extração de Componentes Temporais
- Criadas colunas: Mes, Ano, DiaDoAno, Hora a partir de DataHora
- Mapeamento de meses para nomes abreviados (Jan, Fev, etc.)

### Sazonalidade
- Gráfico de contagem de focos por mês: Mostra picos em meses secos (e.g., agosto-setembro)
- Indica sazonalidade dos incêndios no Cerrado

## Análise de Correlação

### Matriz de Correlação
- Variáveis numéricas: DiaSemChuva, Precipitacao, RiscoFogo, FRP, Temperatura_C, Umidade_Relativa_%, Vento_ms
- Heatmap: Correlações positivas/negativas, e.g., RiscoFogo com Temperatura e Umidade (negativa)

## Análise Espacial

### Municípios com Mais Focos
- Top 15 municípios: Gráfico de barras mostrando os mais afetados

### Mapas
- Mapa de municípios do Cerrado Mineiro: Destaca cidades pertencentes ao bioma vs. outros
- Mapa de calor (Choropleth): Densidade de focos por município, usando shapefiles do IBGE via geobr

## Conclusões

A EDA revelou padrões importantes nos focos de incêndio no Cerrado Mineiro:
- **Sazonalidade**: Maior incidência em meses secos
- **Correlações**: Forte relação entre risco de fogo e condições meteorológicas (temperatura alta, baixa umidade)
- **Hotspots**: Municípios específicos concentram a maioria dos focos
- **Dados**: Boa cobertura, mas atenção a valores nulos e outliers

Recomendações para análises futuras: Modelagem preditiva, integração com dados adicionais (e.g., vegetação), validação de dados.

Para mais detalhes, consulte o notebook `eda_cerrado_mineiro.ipynb`.