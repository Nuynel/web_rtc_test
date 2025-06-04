export { Link }

function Link(props: { href?: string; className?: string; children: React.ReactNode, target?: string, rel?: string }) {
  return <a {...props} href={props.href} />
}
