import pdfplumber
from rapidfuzz import fuzz, process

# 1. Lista de direcciones a buscar (pueden venir de otro sistema o ser cargadas desde Excel)
domicilios_a_validar = [
    "Calle Pepito 123",
    "Av. Mitre 2000",
    "Rivadavia 980"
]

# 2. Leer el texto completo de un contrato en PDF
def extraer_texto_pdf(ruta_pdf):
    texto_completo = ""
    with pdfplumber.open(ruta_pdf) as pdf:
        for pagina in pdf.pages:
            texto_completo += pagina.extract_text() + "\n"
    return texto_completo

# 3. Buscar coincidencias aproximadas
def buscar_domicilios(texto_pdf, lista_direcciones, umbral=85):
    resultados = []
    for domicilio in lista_direcciones:
        match, score, _ = process.extractOne(domicilio, [texto_pdf], scorer=fuzz.partial_ratio)
        if score >= umbral:
            resultados.append((domicilio, score))
    return resultados

# 4. Ejecutar
ruta_pdf = r"C:\Users\Propietario\OneDrive\Escritorio\prueba_comparador.pdf"

texto_pdf = extraer_texto_pdf(ruta_pdf)
coincidencias = buscar_domicilios(texto_pdf, domicilios_a_validar)

# 5. Mostrar resultados
if coincidencias:
    print("🏠 Domicilios encontrados en el contrato:")
    for domicilio, score in coincidencias:
        print(f"- {domicilio} (coincidencia: {score}%)")
else:
    print("⚠️ Ningún domicilio de la lista fue encontrado en el contrato.")
