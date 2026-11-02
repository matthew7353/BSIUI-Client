function Avatar({ username }: { username: string }) {
  return (
    <span className="avatar" aria-hidden="true">
      {username.charAt(0).toUpperCase()}
    </span>
  )
}

export default Avatar
