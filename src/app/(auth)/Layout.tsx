
interface Props {
    children: React.ReactNode
}

const Layout = ({ children }: Props) => {
  return (
    <div className="flex flex-col gap-10 w-100 mx-auto mt-20">
      {children}
    </div>
  )
}

export default Layout