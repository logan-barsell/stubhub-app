import buildClient from '../api/buildClient';

const Landing = ({ currentUser }) => {
  return currentUser ? (
    <h1>You are signed in</h1>
  ) : (
    <h1>Please sign up or sign in.</h1>
  );
};

Landing.getInitialProps = async context => {
  const client = buildClient(context);
  const { data } = await client.get('/api/users/currentUser');
  return data;
};

export default Landing;
