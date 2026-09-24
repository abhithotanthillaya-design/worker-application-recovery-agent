import { Icon } from '../common/Icon'

export interface SelectedFile { file: File; id: string }
function sizeLabel(size: number) { return size < 1024 * 1024 ? `${Math.max(1, Math.round(size / 1024))} KB` : `${(size / 1024 / 1024).toFixed(1)} MB` }
export function SelectedFiles({ files, onRemove }: { files: SelectedFile[]; onRemove: (id: string) => void }) {
  if (!files.length) return null
  return <div className="selected-files" aria-label="Selected files">{files.map(({ file, id }) => <div className="selected-file" key={id}><span className="file-icon"><Icon name="file" size={17}/></span><span className="file-meta"><b>{file.name}</b><small>{sizeLabel(file.size)} · Selected on this device</small></span><span className="selected-state">Selected</span><button className="remove-file" onClick={() => onRemove(id)} aria-label={`Remove ${file.name}`}><Icon name="close" size={16}/></button></div>)}</div>
}
