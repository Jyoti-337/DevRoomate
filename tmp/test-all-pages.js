const pages = [
  '/',
  '/developers',
  '/requests',
  '/profile/alexdev0',
  '/profile/edit',
  '/messages',
  '/pings',
  '/post-request',
  '/hackathons',
  '/pricing',
  '/about',
  '/privacy',
  '/terms',
  '/blog',
  '/login',
  '/signup',
  '/api/users',
  '/api/chats/unread-count'
];

async function checkAllPages() {
  console.log("=== FULL PAGE SWEEP TEST ===");
  let failed = 0;

  for (const page of pages) {
    const url = `http://localhost:3000${page}`;
    try {
      const res = await fetch(url);
      console.log(`[${res.status === 200 ? 'PASS' : 'FAIL'}] ${page} -> Status ${res.status}`);
      if (res.status !== 200) {
        failed++;
      }
    } catch (err) {
      console.error(`[FAIL] ${page} -> Error: ${err.message}`);
      failed++;
    }
  }

  console.log("==========================================");
  if (failed === 0) {
    console.log("ALL PAGES OPERATING AT 100% (STATUS 200 OK)!");
  } else {
    console.log(`SWEEP COMPLETED WITH ${failed} FAILURES.`);
  }
}

checkAllPages();
