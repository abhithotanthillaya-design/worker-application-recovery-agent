import { Icon } from './Icon'

export function RemoteState({ message, error, retry }: { message: string; error?: string; retry?: () => void }) {
  return <div className={`remote-state ${error ? 'remote-error' : ''}`} role={error ? 'alert' : 'status'}><span className="remote-state-icon">{error ? '!' : <span className="spinner"/>}</span><div><b>{error ? 'Connection issue' : message}</b><p>{error ?? 'Please wait a moment.'}</p></div>{error && retry && <button className="button button-secondary button-small" onClick={retry}><Icon name="clock" size={14}/>Retry</button>}</div>
}
