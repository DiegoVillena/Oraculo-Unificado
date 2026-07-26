// data/iching-svg.js — Generador de hexagramas I Ching como SVG inline
// Elimina la dependencia de archivos PNG. Cada hexagrama se dibuja
// a partir de su código binario de 6 líneas (yang=1, yin=0).
// Las líneas mutantes se muestran con un círculo indicador.

/**
 * Genera el SVG de un hexagrama del I Ching.
 * @param {string} codigo - Código binario de 6 dígitos (ej: "111111" para El Cielo)
 * @param {number} tamano - Tamaño en px del SVG (default: 70)
 * @param {boolean} mostrarMutantes - Si true, muestra indicadores de líneas mutantes
 * @param {number[]} lineasMutantes - Índices (1-6) de líneas mutantes
 * @returns {string} SVG string
 */
export function generarHexagramaSVG(codigo, tamano = 70, mostrarMutantes = false, lineasMutantes = []) {
  const w = tamano;
  const h = tamano;
  const lineWidth = w * 0.8;
  const lineH = h * 0.06;
  const gap = h * 0.08;
  const startY = h * 0.1;
  const cx = w / 2;
  const yinGap = lineWidth * 0.08;

  let svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">`;

  // Las líneas se dibujan de arriba (línea 6) a abajo (línea 1)
  // El código binario está en orden de línea 1 (bottom) a línea 6 (top)
  // idx 0 = línea 1 (abajo), idx 5 = línea 6 (arriba)
  for (let i = 5; i >= 0; i--) {
    const bit = codigo[i];
    const y = startY + (5 - i) * (lineH + gap);
    const numLinea = i + 1; // 1-indexed
    const esMutante = mostrarMutantes && lineasMutantes.includes(numLinea);
    const stroke = esMutante ? '#ff5252' : '#e8c46a';
    const strokeWidth = lineH;

    if (bit === '1') {
      // Línea Yang (sólida)
      svg += `<rect x="${cx - lineWidth/2}" y="${y}" width="${lineWidth}" height="${strokeWidth}" rx="${strokeWidth/4}" fill="${stroke}"/>`;
    } else {
      // Línea Yin ( partida)
      const halfW = (lineWidth - yinGap) / 2;
      svg += `<rect x="${cx - lineWidth/2}" y="${y}" width="${halfW}" height="${strokeWidth}" rx="${strokeWidth/4}" fill="${stroke}"/>`;
      svg += `<rect x="${cx + yinGap/2}" y="${y}" width="${halfW}" height="${strokeWidth}" rx="${strokeWidth/4}" fill="${stroke}"/>`;
    }

    // Indicador de mutante (círculo a la derecha)
    if (esMutante) {
      svg += `<circle cx="${cx + lineWidth/2 + 6}" cy="${y + strokeWidth/2}" r="2.5" fill="#ff5252"/>`;
    }
  }

  svg += '</svg>';
  return svg;
}

/**
 * Genera el SVG de un hexagrama a partir de su número (1-64).
 * Usa el diccionario inverso de tarot-data.js para obtener el código.
 */
export function generarHexagramaPorNum(num, tamano = 70) {
  // Tabla de códigos binarios por número de hexagrama
  // Esta es la tabla estándar del I Ching (Rey Wen)
  const codigos = {
    1: "111111", 2: "000000", 3: "100010", 4: "010001", 5: "111010",
    6: "010111", 7: "010000", 8: "000010", 9: "111011", 10: "110111",
    11: "111000", 12: "000111", 13: "101111", 14: "111101", 15: "001000",
    16: "000100", 17: "100110", 18: "011001", 19: "110000", 20: "000011",
    21: "100101", 22: "101001", 23: "000001", 24: "100000", 25: "100111",
    26: "111001", 27: "100001", 28: "011110", 29: "010010", 30: "101101",
    31: "001110", 32: "011100", 33: "001111", 34: "111100", 35: "000101",
    36: "101000", 37: "101011", 38: "110101", 39: "001010", 40: "010100",
    41: "110001", 42: "100011", 43: "111110", 44: "011111", 45: "000110",
    46: "011000", 47: "010110", 48: "011010", 49: "101110", 50: "011101",
    51: "100100", 52: "001001", 53: "001011", 54: "110100", 55: "101100",
    56: "001101", 57: "011011", 58: "110110", 59: "010011", 60: "110010",
    61: "110011", 62: "001100", 63: "101010", 64: "010101"
  };
  const codigo = codigos[num] || "000000";
  return generarHexagramaSVG(codigo, tamano);
}