async function test() {
  try {
    // 1. Register
    const email = `test${Date.now()}@test.com`;
    console.log('Registering', email);
    const regRes = await fetch('http://localhost:5000/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email, password: 'password123' })
    });
    const regData = await regRes.json();
    console.log('Reg Result:', regRes.status, regData);
    if (!regData.token) return;

    // 2. Add Address
    console.log('Adding address...');
    const addrRes = await fetch('http://localhost:5000/api/users/address', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${regData.token}` 
      },
      body: JSON.stringify({
        label: 'Home', name: 'John Doe', phone: '1234567890', line1: 'Test', state: 'TS', city: 'City', pincode: '123'
      })
    });
    const addrData = await addrRes.json();
    console.log('Address Added Status:', addrRes.status);
    console.log('Address Added Data:', addrData);
  } catch (err) {
    console.log('Error', err.message);
  }
}
test();
