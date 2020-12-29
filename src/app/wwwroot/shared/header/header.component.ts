import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserStateService } from 'src/app/services/user-state/user-state.service'

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

    public isLoggedIn: boolean = false;

    constructor(
        private _router: Router,
        private _userStateService: UserStateService
    ) { }

    ngOnInit(): void {
        this._userStateService.getCurrentUserObs().subscribe(user => {
            this.isLoggedIn = user ? true : false;
        });
    }

    public logoutUser(): void {
        if (this._userStateService.processLogout()) {
            this._router.navigate(['login']);
        }
    }

}
