import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

export class CustomValidators {
  static invalidProjectname(control: FormControl): {[s: string]: boolean} {
    
    if(control.value === 'Test'){
      return {'invalidProjectname': true}
    }
    return null;
  }

  static asyncinvalidProjectname(control: FormControl): Promise<{[s: string]: boolean}> | Observable<{[s: string]: boolean}> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if(control.value === 'Test123'){
          resolve({'invalidProjectname': true});
        } else resolve(null);
      }, 2000);
    });
  }
  
}
