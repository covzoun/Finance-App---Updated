const fs = require('fs');
let file = fs.readFileSync('src/components/WalletDetails.tsx', 'utf8');

// The file might be slightly broken from the previous script at the end.
// Let's check the end.
file = file.replace(
  '        )}</div>\n      </div>\n    </div>\n  );\n}',
  '      </div>\n    </div>\n  );\n}'
);

file = file.replace(
  '        )}</div>      </div>    </div>  );}',
  '      </div>\n    </div>\n  );\n}'
);

file = file.replace(
  /\{\/\* Record transaction button \*\//,
  '{!isEditing && (\n          <>\n        {/* Record transaction button */}'
);

file = file.replace(
  '          )}\n                  </>\n        )}',
  '          )}\n          </>\n        )}'
);

// If `</>\n        )}` is missing at the end of the activity block:
if (!file.includes('</>\n        )}')) {
  file = file.replace(
    '          )}\n      </div>\n    </div>',
    '          )}\n          </>\n        )}\n      </div>\n    </div>'
  );
}

fs.writeFileSync('src/components/WalletDetails.tsx', file);
