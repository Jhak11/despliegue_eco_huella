try {
    console.log('Importing database...');
    await import('./src/config/database.js');
    console.log('Database loaded');

    console.log('Importing gamificationService...');
    await import('./src/services/gamificationService.js');
    console.log('GamificationService loaded');

    console.log('Importing missionsController...');
    await import('./src/controllers/missionsController.js');
    console.log('MissionsController loaded');
} catch (e) {
    console.error('ERROR:', e);
}
