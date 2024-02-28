export default function CustomLink({ link, text }) {
  const handleCloseMenu = () => {
    document.getElementById("toggle_nav").checked = false;
  };

  return (
    <a
      href={link}
      className="block md:px-4 transition hover:text-primary"
      onClick={handleCloseMenu}
    >
      <span>{text}</span>
    </a>
  );
}
