import React, { useEffect, useState } from 'react'
import moment from 'moment';
import { instance } from '../../axios';
import { environment } from '../../environments/environment';
import Loader from '../../components/Loader';
import {IonButton, IonContent, IonIcon, IonModal, IonRippleEffect, useIonToast} from '@ionic/react';

import './Schedule.css'
import { Column } from '@material-table/core';
import Table from '../../components/Table';
import { logoDiscord, logoTwitter, link } from 'ionicons/icons';
import {useHistory} from "react-router";

interface Mint {
	image: string;
	project: string;
	twitterLink: string;
	discordLink: string;
	projectLink: string;
	time: string;
	tillTheMint: string;
	count: string;
	price: string;
	extras: string;
	tenDaySearchResults: string[];
	mintExpiresAt: string;
	numbersOfDiscordMembers: string;
    DiscordOnlineMembers: string;
	numbersOfTwitterFollowers : number;
	tweetInteraction : {
		total : number;
		likes: number;
		comments: number;
		reactions: number;
	}
}
const Schedule = () => {

    /**
     * States & Variables.
     */
    const [present, dismiss] = useIonToast();
    const history = useHistory();

    const [date, setDate] = useState('')
    const [mints, setMints] = useState<Mint[]>([])
    const [splitCollectionName, setSplitCollectionName] = useState([])

    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    let dataSource = mints

    /**
     * This will call the every minute to update the mints array and assign mintExpiresAt field
     * which is calculated with moment.fromNow()
     * So as we are scrapping the data every hour and since we would have an hour old data
     * this will keep updating the time of when the mint will expire
     */
     const addMintExpiresAt = () => {
        for(let i = 0; i < dataSource.length; i++) {
            if(dataSource[i].time !== "")
            dataSource[i].mintExpiresAt = " (" + moment.utc(dataSource[i].time, 'hh:mm:ss').fromNow() + ")";
        }
          setMints([...dataSource]);
     }

     useEffect(() => {
        dataSource.length && addMintExpiresAt();

        const interval = setInterval(() => {
          for(let i = 0; i < dataSource.length; i++) {
              if(dataSource[i].time !== "")
              dataSource[i].mintExpiresAt = " (" + moment.utc(dataSource[i].time, 'hh:mm:ss').fromNow() + ")"
          }
            setMints([...dataSource])
        }, 60000)

        return () => clearInterval(interval);
    }, [dataSource.length]);


    // Get today's mints
    const fetchMintsData = () => {
        setIsLoading(true);

        instance
            .get(environment.backendApi + '/getTodaysMints')
            .then((res) => {
                setMints(res.data.data.mints);
                setDate(res.data.data.date);
                setIsLoading(false);
            })
            .catch((error) => {
                setIsLoading(false);

                console.error("error when getting mints: " + error);

                let msg = '';
                if (error && error.response) {
                    msg = String(error.response.data.body);
                } else {
                    msg = 'Unable to connect. Please try again later';
                }

                present({
                    message: msg,
                    color: 'danger',
                    duration: 5000
                });
                // if(msg.includes('logging in again')){
                //     history.push("/login");
                // }

            })
    }

    useEffect(() => {
        fetchMintsData();
    }, []);


    // This will call the mintExpiresAt function every minute to update tillTheMint's time
    // useEffect(() => {
    //     const interval = setInterval(() => {
    //       mintExpiresAt(mints)
    //     }, 60000)
    //
    //     return () => clearInterval(interval);
    // }, [mints]);


    /**
     * this function is used to update the time of tillTheMint every minute
     * @param {[]} mints array
     * @return {} update the mints array objects values => tillTheMint to new values
     */
        // const mintExpiresAt = (arr: any) => {
        //   for(let i = 0; i < arr.length; i++) {
        //     if(arr[i].mintExpiresAt || arr[i].mintExpiresAt?.length !== 0) {
        //       const timeNow = moment()
        //       const timeExpiresAt = moment(arr[i].mintExpiresAt)
        //
        //       const diff = (timeExpiresAt.diff(timeNow))
        //
        //       let minutes = Math.floor((diff / (1000 * 60)) % 60)
        //       let hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
        //
        //       let splitArr = arr[i].tillTheMint.split(" ") // ['6', 'hours', '23', 'minutes']
        //
        //       splitArr[0] = hours
        //       splitArr[2] = minutes
        //
        //       arr[i].tillTheMint = splitArr.join(" ")
        //     }
        //   }
        // }

    const handleProjectClick = (project: any) => {
            setIsOpen(!isOpen);
            setIsLoading(true);

            // Temporarily set this condition below since old collection has 10DaySearchResults field
            // which is conflicting with new renamed field tenDaySearchResults
            setSplitCollectionName(!project.tenDaySearchResults ? project['10DaySearchResults'] : project.tenDaySearchResults);
            setIsLoading(false);
        }

    // @ts-ignore
    const columns: Column<Mint>[] = [
        {
            title: '',
            render: (record) => (
                <div className="flex space-x-3">
                    <a
                        href={record.discordLink}
                        target="_blank"
                        style={{
                            pointerEvents : (record.discordLink && record.numbersOfDiscordMembers) ? "initial" : "none"
                        }}
                        className={(record.discordLink && record.numbersOfDiscordMembers) ? "schedule-link" : "schedule-link-disabled"}
                    >
                        <IonIcon icon={logoDiscord} className="big-emoji"/>
                        <IonRippleEffect />
                    </a>
                    <a
                        href={record.twitterLink}
                        className="schedule-link"
                        target="_blank"

                    >
                        <IonIcon icon={logoTwitter} className="big-emoji" />
                        <IonRippleEffect />

                    </a>
                    <a
                        href={record.projectLink}
                        className={(record.projectLink && record.projectLink) ? "schedule-link" : "schedule-link-disabled"}
                        target="_blank"

                    >
                        <IonIcon icon={link} className="big-emoji" />
                        <IonRippleEffect />

                    </a>
                </div>
            ),
        },
        {
            title: 'Name',
            render: (record) => (
                <span
                    // cursor-pointer
                    className=""
                    onClick={() => handleProjectClick(record)}
                >
                    {record.project}
                </span>
            ),
            customSort: (a, b) => a.project.localeCompare(b.project),
            customFilterAndSearch: (term, rowData) =>
                rowData.project.toLowerCase().includes(term.toLowerCase()),
        },
        {
            title: 'Time',
            customSort: (a, b) => +new Date(a.time) - +new Date(b.time),
            render: (record) => (
                <span>
                    {record.time}
                    <span
                        hidden={record.mintExpiresAt.indexOf('Invalid') !== -1}
                    >
                        {record.mintExpiresAt}
                    </span>
                    {/* {record.time !== "" && " (" + moment.utc(record.time, 'hh:mm:ss').fromNow() + ")"} */}
                    {
                        // setInterval(() => {
                        //     <p>ok</p>
                        //     // updateTime(record.time)
                        // }, 6000)
                    }
                </span>
            ),
        },
        {
            title: 'Price',
            customSort: (a, b) =>
                +a.price.split(' ')[0] - +b.price.split(' ')[0],
            render: (record) => <span dangerouslySetInnerHTML={{ __html: record.price.replace(/public/gi, "<br>public") }}></span>,
            // width: "80px"
        },
        {
            title: 'Supply',
            customSort: (a, b) => + a.count.replace(',', '') - + b.count.replace(',', ''),
            render: (record) => <span>{record.count?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>,
        },
        {
            title: 'Discord (all)',
            render: (record) => (
                <>
                    {record.numbersOfDiscordMembers
                        ?.toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                </>
            ),
            // @ts-ignore
            customSort: (a, b) => a.numbersOfDiscordMembers - b.numbersOfDiscordMembers,
        },
        {
            title: 'Discord (online)',
            render: (record) => (
                <>
                    {record.DiscordOnlineMembers
                        ?.toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                </>
            ),
            // @ts-ignore
            customSort: (a, b) => a.DiscordOnlineMembers - b.DiscordOnlineMembers,
        },
        {
            title: 'Twitter',
            render: (record) => (
                <>
                    {record.numbersOfTwitterFollowers
                        ?.toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                </>
            ),
            customSort: (a, b) =>
                a.numbersOfTwitterFollowers - b.numbersOfTwitterFollowers,
        },
        {
            title: 'Tweet Interactions',
            customSort: (a, b) =>
                a.tweetInteraction.total - b.tweetInteraction.total,
            render: (record) => (
                <>
                    <span>
                        {record.tweetInteraction.total}
                        {/*likes: {record.tweetInteraction?.likes} <br />*/}
                        {/*comments: {record.tweetInteraction?.comments} <br />*/}
                        {/*retweets: {record.tweetInteraction?.retweets}*/}
                    </span>
                </>
            ),
        },
    ];

    // Renders
    return (
        <>
            {/*w-full bg-satin-3 rounded-lg pt-3 pb-6 pr-3 pl-3 h-fit xl:pb-3 2xl:pb-2 lg:pb-4 max-w-fit mx-auto mb-10*/}

            {isLoading ? (
                <div className="pt-10 flex justify-center items-center">
                    <Loader />
                </div>
            ) : (
                <div>
                    <Table
                        data={dataSource}
                        columns={columns}
                        title={`Mint Schedule - ${date}`}
                        // options={{
                        //     rowStyle: {
                        //         overflowWrap: 'break-word'
                        //     }
                        // }}
                        description={`Projects must have > 2,000 Discord members (with > 300 being online), and  > 1,000 Twitter followers before showing up on the list.
							\n "# Tweet Interactions" gets an average of the Comments / Likes / Retweets (over the last 5 tweets), and adds them`}
                    />

                    {/* <IonModal isOpen={isOpen}  onDidDismiss={onClose as any} >
                          <IonContent>
                            {
                              splitCollectionName.length
                              && splitCollectionName?.map(name => (
                                  <div key={name} className='text-center'>
                                    <span style={{color: 'white'}}>{name}</span> <br />
                                  </div>
                              ))
                            }
                          </IonContent>
                        </IonModal> */}
                </div>
            )}
        </>
    );
}

// @ts-ignore
export default Schedule;
