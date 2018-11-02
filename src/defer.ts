export default (f: () => void): NodeJS.Timer => setTimeout(f, 0)
