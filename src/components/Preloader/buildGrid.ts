export interface GridCell {
  char: string
  brand: boolean
}

const ROWS = 5
const MIN_COLUMNS = 19
const WORD_GAP = 3

function randomChar(alphabet: string): string {
  return alphabet[Math.floor(Math.random() * alphabet.length)]
}

export function buildGrid(name: string, alphabet: string): GridCell[][] {
  const words = name.toUpperCase().split(/\s+/).filter(Boolean)
  const brandWidth = words.join('').length + WORD_GAP * (words.length - 1)
  const columns = Math.max(MIN_COLUMNS, brandWidth + 1)
  const brandRow = Math.floor(ROWS / 2)

  return Array.from({ length: ROWS }, (_, row) => {
    const cells = Array.from({ length: columns }, () => ({
      char: randomChar(alphabet),
      brand: false,
    }))
    if (row !== brandRow) return cells

    let column = 0
    words.forEach((word) => {
      for (const char of word) cells[column++] = { char, brand: true }
      column += WORD_GAP
    })
    return cells
  })
}
