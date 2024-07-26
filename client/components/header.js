import Link from 'next/link';

const Header = ({ currentUser }) => {
  const links = [
    !currentUser && { label: 'Sign Up', href: '/auth/signup' },
    !currentUser && { label: 'Sign In', href: '/auth/signin' },
    currentUser && { label: 'Sign Out', href: '/auth/signout' },
  ]
    .filter(l => l)
    .map(l => {
      return (
        <>
          <li className='nav-item'>
            <Link
              className='nav-link'
              href={l.href}
            >
              {l.label}
            </Link>
          </li>
        </>
      );
    });

  return (
    <>
      <nav className='navbar navbar-light bg-light'>
        <Link
          className='navbar-brand'
          href='/'
        >
          StubbHubb
        </Link>
        <div className='d-flex justify-content-end'>
          <ul className='nav d-flex align-items-center'>{links}</ul>
        </div>
      </nav>
    </>
  );
};
export default Header;
