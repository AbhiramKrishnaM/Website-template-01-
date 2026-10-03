export function StageLights() {
  return (
    <>
      <hemisphereLight args={['#fffaf4', '#8c8079', 1.4]} />
      <directionalLight position={[3, 5, 6]} intensity={2.2} />
      <directionalLight position={[-4, 2, -3]} intensity={0.8} />
    </>
  )
}
