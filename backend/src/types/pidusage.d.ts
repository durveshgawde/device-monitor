
declare module 'pidusage' {
  export interface ProcessStats {
    cpu: number
    memory: number
    memory_percent?: number
    comm?: string
    cmd?: string
    [key: string]: any
  }

  export function processes(options?: { all?: boolean }): Promise<Record<string, ProcessStats>>

  const pidusage: {
    (pid: number | string | Array<number | string>, callback?: (err: Error | null, stats?: ProcessStats | Record<string, ProcessStats>) => void): void | Promise<ProcessStats | Record<string, ProcessStats>>
    processes: typeof processes
  }

  export default pidusage
}
