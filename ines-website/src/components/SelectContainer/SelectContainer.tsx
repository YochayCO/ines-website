import './SelectContainer.css'

function SelectContainer({ children }: { children: JSX.Element }) {
  return (
    <div className='select-container'>
      {children}
    </div>
  )
}

export default SelectContainer
