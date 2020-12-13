import React from "react";
import './UserAvatar.scss';

export interface UserAvatarProperties {
    alias: string,
    github: string,
}

export default class UserAvatar extends React.Component<UserAvatarProperties>
{
    static imageDimension = 75;

    getImageSource() {
        if(this.props.github?.length > 0)
        {
            return `${this.props.github}.png?size=${UserAvatar.imageDimension}`;
        }
    }

    render() {
        return (
            <span className="user-avatar">
                <a href={this.props.github}>
                    <img src={this.getImageSource()} alt={`Image of ${this.props.alias}`}/>
                </a>
            </span>
        );
    }
}