const backgroundColors = [
  'rgba(52, 235, 103, 0.6)',
  'rgba(131, 52, 235, 0.8)',
  'rgba(252, 186, 3, 0.8)',
  'rgba(252, 3, 3, 0.8)',
  'rgba(138, 2, 153, 0.8)',
  'rgba(5, 242, 226, 0.8)',
]

export function getBackgroundColor(index) {
  return backgroundColors[index % backgroundColors.length]
}
