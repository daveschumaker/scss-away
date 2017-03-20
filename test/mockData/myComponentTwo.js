// Test example to look for stylesheets in another folder.

var stylesheet = require('./stylesheets/myComponentTwo.js');

var html = `
    <div class="myComponentTwo">
        <h1 id="myComponentTwo-h1>My Component Two</h1>
        <div class="icon">With a bunch of random HTML.</div>
        <div class="myComponentTwo-content">
            <div class="myComponentTwo-section">
                There is some content here.
            </div>
        </div>
    </div>
`;
