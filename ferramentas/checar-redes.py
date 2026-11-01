"""Confere redes-dados.json: projetos existentes, enderecos do Instagram e codigos de video."""
import json, os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ler = lambda nome: json.load(open(os.path.join(RAIZ, nome), encoding='utf-8'))
projetos, redes, erros = ler('projetos-dados.json'), ler('redes-dados.json'), []
for slug, blocos in redes.items():
    if slug not in projetos:
        erros.append(f'{slug}: projeto inexistente')
    for chave in blocos:
        if chave not in ('instagram', 'youtube'):
            erros.append(f'{slug}: lista desconhecida "{chave}"')
    for i in blocos.get('instagram', []):
        if not i.get('titulo') or not re.fullmatch(r'https://www\.instagram\.com/[\w./-]+', i.get('url', '')):
            erros.append(f'{slug}: post do Instagram incompleto ou com endereco invalido: {i}')
    for i in blocos.get('youtube', []):
        if not i.get('titulo') or not re.fullmatch(r'[\w-]{11}', i.get('id', '')):
            erros.append(f'{slug}: video do YouTube incompleto ou com codigo invalido: {i}')
print('\n'.join(erros) or 'Tudo certo.')
sys.exit(1 if erros else 0)
