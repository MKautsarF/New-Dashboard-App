import newlogo from "@/static/newLogo.jpg";

const Logo = () => {
  return (
    <div className="flex gap-2 items-center justify-center">
      <img src={newlogo} alt="New Logo" height={130} />
    </div>
  );
};

export default Logo;
